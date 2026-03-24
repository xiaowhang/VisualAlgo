import type { AlgorithmStep, SortingHighlightKind } from '@/types/algorithm';

interface SortingStepOptions {
  pivotIndices?: number[];
  doneIndices?: number[];
}

export function createSortingStep(
  values: number[],
  activeIndices: number[],
  swappedIndices: number[],
  description: string,
  options?: SortingStepOptions
): AlgorithmStep {
  const highlights: Partial<Record<number, SortingHighlightKind>> = {};

  for (const index of activeIndices) {
    highlights[index] = 'compare';
  }

  for (const index of options?.pivotIndices ?? []) {
    highlights[index] = 'pivot';
  }

  for (const index of swappedIndices) {
    highlights[index] = 'swap';
  }

  for (const index of options?.doneIndices ?? []) {
    highlights[index] = 'done';
  }

  return {
    kind: 'sorting',
    values: [...values],
    highlights,
    description,
  };
}
