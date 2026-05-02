import { graphRegistries } from '@/algorithms/definitions/graph';
import { sortingRegistries } from '@/algorithms/definitions/sorting';
import { treesRegistries } from '@/algorithms/definitions/trees';
import { divideConquerRegistries } from '@/algorithms/definitions/divide-conquer';
import { dynamicProgrammingRegistries } from '@/algorithms/definitions/dynamic-programming';
import { greedyRegistries } from '@/algorithms/definitions/greedy';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const allAlgorithmRegistries: AlgorithmDefinition[] = [
  ...sortingRegistries,
  ...graphRegistries,
  ...treesRegistries,
  ...divideConquerRegistries,
  ...dynamicProgrammingRegistries,
  ...greedyRegistries,
];
