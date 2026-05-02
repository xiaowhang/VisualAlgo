import type { AlgorithmStep, TimelineInterval, TimelineIntervalState } from '@/types/algorithm';

interface CreateTimelineStepConfig {
  intervals: TimelineInterval[];
  highlights?: Partial<Record<string, TimelineIntervalState>>;
  currentInterval?: string | null;
  lastSelected?: string | null;
  description: string;
}

export function createTimelineStep(config: CreateTimelineStepConfig): AlgorithmStep {
  return {
    kind: 'timeline',
    intervals: config.intervals.map(interval => ({ ...interval })),
    highlights: { ...config.highlights },
    currentInterval: config.currentInterval ?? null,
    lastSelected: config.lastSelected ?? null,
    description: config.description,
  };
}
