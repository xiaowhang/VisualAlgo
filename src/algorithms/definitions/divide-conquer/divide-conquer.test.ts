import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SortingStep, HanoiStep } from '@/types/algorithm';

// Mock the inputs module so createSteps() gets deterministic data
vi.mock('@/algorithms/shared/inputs', () => ({
  getSortingInput: vi.fn(() => [1, 3, 5, 7, 9, 11, 13, 15]),
  getHanoiDiskCount: vi.fn(() => 3),
}));

// Import registries AFTER mock is in place
import { binarySearchRegistry } from './binary-search.registry';
import { hanoiRegistry } from './hanoi.registry';

describe('binary-search', () => {
  let steps: SortingStep[];

  beforeEach(() => {
    // binary-search picks a random target via Math.random(); seed it for determinism
    vi.spyOn(Math, 'random').mockReturnValue(0);
    steps = binarySearchRegistry.createSteps() as SortingStep[];
  });

  it('createSteps() returns a non-empty array', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind === "sorting"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('sorting');
    }
  });

  it('every step has a values array matching input length', () => {
    for (const step of steps) {
      expect(step.values).toHaveLength(8);
    }
  });

  it('steps contain comparison-related descriptions', () => {
    const hasComparison = steps.some(
      s =>
        s.description.includes('比较') ||
        s.description.includes('检索') ||
        s.description.includes('检查') ||
        s.description.includes('搜索') ||
        s.description.includes('找到') ||
        s.description.includes('索引')
    );
    expect(hasComparison).toBe(true);
  });

  it('finds the target (first element when random=0) and marks it done', () => {
    // With Math.random()=0 and sorted input [1,3,5,7,9,11,13,15],
    // targetIndex=0 -> target=1
    const lastStep = steps[steps.length - 1];
    const doneEntries = Object.entries(lastStep.highlights).filter(([, v]) => v === 'done');
    expect(doneEntries.length).toBeGreaterThan(0);
  });
});

describe('hanoi', () => {
  let steps: HanoiStep[];

  beforeEach(() => {
    steps = hanoiRegistry.createSteps() as HanoiStep[];
  });

  it('createSteps() returns a non-empty array', () => {
    expect(steps.length).toBeGreaterThan(0);
  });

  it('every step has kind === "hanoi"', () => {
    for (const step of steps) {
      expect(step.kind).toBe('hanoi');
    }
  });

  it('every step has a pegs array with 3 pegs', () => {
    for (const step of steps) {
      expect(step.pegs).toHaveLength(3);
    }
  });

  it('first step has all 3 disks on peg A', () => {
    const firstStep = steps[0];
    // Disks are stored largest-first: [3, 2, 1]
    expect(firstStep.pegs[0].disks).toEqual([3, 2, 1]);
    expect(firstStep.pegs[0].id).toBe('A');
    expect(firstStep.pegs[1].disks).toEqual([]);
    expect(firstStep.pegs[2].disks).toEqual([]);
  });

  it('last step has all disks on peg C', () => {
    const lastStep = steps[steps.length - 1];
    expect(lastStep.pegs[2].id).toBe('C');
    expect(lastStep.pegs[2].disks).toEqual([3, 2, 1]);
    expect(lastStep.pegs[0].disks).toEqual([]);
    expect(lastStep.pegs[1].disks).toEqual([]);
  });

  it('total move steps equals 2^3 - 1 = 7', () => {
    // Steps include the initial state (move===null) plus actual moves
    const moveSteps = steps.filter(s => s.move !== null);
    expect(moveSteps).toHaveLength(7);
  });

  it('first step has null move (initial state)', () => {
    expect(steps[0].move).toBeNull();
  });

  it('every move step has valid from/to/disk fields', () => {
    const moveSteps = steps.filter(s => s.move !== null);
    for (const step of moveSteps) {
      expect(step.move!.from).toBeDefined();
      expect(step.move!.to).toBeDefined();
      expect(typeof step.move!.disk).toBe('number');
      expect(step.move!.disk).toBeGreaterThan(0);
    }
  });
});
