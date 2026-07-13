/** Deterministic helpers: mock data is reproducible between reloads. */
export const pick = <T>(values: readonly T[], index: number): T => values[Math.abs(index) % values.length]!;

export const range = (length: number): number[] => Array.from({ length }, (_, index) => index);

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));
