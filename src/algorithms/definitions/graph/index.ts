import { bfsRegistry } from '@/algorithms/definitions/graph/bfs.registry';
import { dfsRegistry } from '@/algorithms/definitions/graph/dfs.registry';
import type { AlgorithmDefinition } from '@/types/algorithm';

export const graphRegistries: AlgorithmDefinition[] = [bfsRegistry, dfsRegistry];
