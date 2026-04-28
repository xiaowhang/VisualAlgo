import { graphRegistries } from '@/algorithms/definitions/graph';
import { sortingRegistries } from '@/algorithms/definitions/sorting';
import { treesRegistries } from '@/algorithms/definitions/trees';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const allAlgorithmRegistries: AlgorithmDefinition[] = [
  ...sortingRegistries,
  ...graphRegistries,
  ...treesRegistries,
];
