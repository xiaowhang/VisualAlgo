import { nQueensRegistry } from './n-queens.registry';
import { subsetSumRegistry } from './subset-sum.registry';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const backtrackingRegistries: AlgorithmDefinition[] = [nQueensRegistry, subsetSumRegistry];
