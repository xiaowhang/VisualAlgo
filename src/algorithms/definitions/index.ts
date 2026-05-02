import { graphRegistries } from '@/algorithms/definitions/graph';
import { sortingRegistries } from '@/algorithms/definitions/sorting';
import { treesRegistries } from '@/algorithms/definitions/trees';
import { divideConquerRegistries } from '@/algorithms/definitions/divide-conquer';
import { dynamicProgrammingRegistries } from '@/algorithms/definitions/dynamic-programming';
import { greedyRegistries } from '@/algorithms/definitions/greedy';
import { backtrackingRegistries } from '@/algorithms/definitions/backtracking';
import { networkFlowRegistries } from '@/algorithms/definitions/network-flow';
import { linearProgrammingRegistries } from '@/algorithms/definitions/linear-programming';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const allAlgorithmRegistries: AlgorithmDefinition[] = [
  ...sortingRegistries,
  ...graphRegistries,
  ...treesRegistries,
  ...divideConquerRegistries,
  ...dynamicProgrammingRegistries,
  ...greedyRegistries,
  ...backtrackingRegistries,
  ...networkFlowRegistries,
  ...linearProgrammingRegistries,
];
