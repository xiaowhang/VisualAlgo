import type { AlgorithmStep, DpHighlightKind } from '@/types/algorithm';

interface CreateDpTableStepConfig {
  table: (number | null)[][];
  rowLabels: string[];
  colLabels: string[];
  currentCell?: [number, number] | null;
  highlights?: Partial<Record<string, DpHighlightKind>>;
  backtrackPath?: [number, number][] | null;
  phase?: 'init' | 'compute' | 'backtrack' | 'done';
  description: string;
}

export function createDpTableStep(config: CreateDpTableStepConfig): AlgorithmStep {
  return {
    kind: 'dp-table',
    description: config.description,
    table: config.table.map(row => [...row]),
    rowLabels: [...config.rowLabels],
    colLabels: [...config.colLabels],
    currentCell: config.currentCell ?? null,
    highlights: { ...config.highlights },
    backtrackPath: config.backtrackPath?.map(([r, c]) => [r, c] as [number, number]) ?? null,
    phase: config.phase ?? 'compute',
  };
}
