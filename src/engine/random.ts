export type RandomSource = () => number;

export const RNG_ALGORITHM = 'mulberry32';
export const RNG_VERSION = '1';

let fallbackSeedCounter = 0;

export function createSeed(): string {
  try {
    const values = new Uint32Array(2);
    globalThis.crypto.getRandomValues(values);
    return values[0].toString(16).padStart(8, '0') + values[1].toString(16).padStart(8, '0');
  } catch {
    fallbackSeedCounter += 1;
    return 'fallback-' + Date.now().toString(36) + '-' + fallbackSeedCounter.toString(36);
  }
}

export function hashStringToUint32(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619) >>> 0;
  }
  return hash >>> 0;
}

export function hashString(value: string): string {
  return hashStringToUint32(value).toString(16).padStart(8, '0');
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'null';
  }
  if (Array.isArray(value)) {
    return '[' + value.map((item) => stableStringify(item)).join(',') + ']';
  }
  const record = value as Record<string, unknown>;
  return '{' + Object.keys(record).sort().map((key) =>
    JSON.stringify(key) + ':' + stableStringify(record[key])
  ).join(',') + '}';
}

/** A deterministic PRNG. Its algorithm/version are part of saved experiment metadata. */
export class SeededRandom {
  public readonly seed: string;
  public readonly stream: string;
  private readonly initialState: number;
  private state: number;

  constructor(seed: string | number, stream = 'default') {
    this.seed = String(seed);
    this.stream = stream;
    this.initialState = hashStringToUint32(
      this.seed + '\u0000' + stream + '\u0000' + RNG_ALGORITHM + '\u0000' + RNG_VERSION
    );
    this.state = this.initialState;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  getState(): number {
    return this.state >>> 0;
  }

  setState(state: number): void {
    if (!Number.isInteger(state) || state < 0 || state > 0xffffffff) {
      throw new RangeError('RNG state must be an unsigned 32-bit integer');
    }
    this.state = state >>> 0;
  }

  reset(): void {
    this.state = this.initialState;
  }
}
