import { lcsRegistry } from './lcs.registry';
import { knapsackRegistry } from './knapsack.registry';
import { investmentRegistry } from './investment.registry';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const dynamicProgrammingRegistries: AlgorithmDefinition[] = [
  lcsRegistry,
  knapsackRegistry,
  investmentRegistry,
];
