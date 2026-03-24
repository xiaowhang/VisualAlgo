import { graphRegistries } from '@/algorithms/definitions/graph';
import { sortingRegistries } from '@/algorithms/definitions/sorting';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const allAlgorithmRegistries: AlgorithmDefinition[] = [
  ...sortingRegistries,
  ...graphRegistries,
];
