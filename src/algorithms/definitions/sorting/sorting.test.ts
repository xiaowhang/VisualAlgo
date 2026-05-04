import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SortingStep } from '@/types/algorithm';

// Mock the inputs module so createSteps() gets deterministic data
vi.mock('@/algorithms/shared/inputs', () => ({
  getSortingInput: vi.fn(() => [5, 3, 8, 1, 9, 2, 7, 4, 6]),
}));

// Import registries AFTER mock is in place
import { bubbleSortRegistry } from './bubble-sort.registry';
import { insertionSortRegistry } from './insertion-sort.registry';
import { selectionSortRegistry } from './selection-sort.registry';
import { mergeSortRegistry } from './merge-sort.registry';
import { quickSortRegistry } from './quick-sort.registry';
import { heapSortRegistry } from './heap-sort.registry';

const INPUT_LENGTH = 9;
const SORTED_ASC = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const sortingAlgorithms = [
  { name: 'bubble-sort', registry: bubbleSortRegistry },
  { name: 'insertion-sort', registry: insertionSortRegistry },
  { name: 'selection-sort', registry: selectionSortRegistry },
  { name: 'merge-sort', registry: mergeSortRegistry },
  { name: 'quick-sort', registry: quickSortRegistry },
  { name: 'heap-sort', registry: heapSortRegistry },
];

describe.each(sortingAlgorithms)('$name', ({ registry }) => {
  let steps: SortingStep[];

  beforeEach(() => {
    steps = registry.createSteps() as SortingStep[];
  });

  it('createSteps() returns a non-empty array', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind === "sorting"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('sorting');
    }
  });

  it('every step has a non-empty description', () => {
    for (const step of steps) {
      expect(typeof step.description).toBe('string');
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('every step has a values array matching input length', () => {
    for (const step of steps) {
      expect(step.values).toHaveLength(INPUT_LENGTH);
    }
  });

  it('last step has values sorted ascending', () => {
    const lastStep = steps[steps.length - 1];
    expect(lastStep.values).toEqual(SORTED_ASC);
  });

  it('first step description contains initialization text', () => {
    expect(steps[0].description).toContain('初始化');
  });

  it('last step has doneIndices in highlights for all positions', () => {
    const lastStep = steps[steps.length - 1];
    expect(lastStep.highlights).toBeDefined();
    for (let i = 0; i < INPUT_LENGTH; i++) {
      expect(lastStep.highlights[i]).toBe('done');
    }
  });
});
