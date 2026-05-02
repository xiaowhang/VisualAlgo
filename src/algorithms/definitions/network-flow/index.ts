import { fordFulkersonRegistry } from './ford-fulkerson.registry';
import { edmondsKarpRegistry } from './edmonds-karp.registry';
import { minCutRegistry } from './min-cut.registry';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const networkFlowRegistries: AlgorithmDefinition[] = [
  fordFulkersonRegistry,
  edmondsKarpRegistry,
  minCutRegistry,
];
