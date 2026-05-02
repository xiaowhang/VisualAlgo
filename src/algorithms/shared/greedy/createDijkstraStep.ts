import { createGraphStep } from '@/algorithms/shared/graph/createGraphStep';
import type { GraphSnapshot } from '@/algorithms/shared/inputs';
import type { AlgorithmStep, GraphStep } from '@/types/algorithm';

export function createDijkstraStep(
  graph: GraphSnapshot,
  current: string | null,
  visited: Set<string>,
  frontier: string[],
  order: string[],
  description: string,
  nodeLabels: Partial<Record<string, string>>
): AlgorithmStep {
  const step = createGraphStep(graph, current, visited, frontier, order, description);
  return { ...(step as GraphStep), nodeLabels };
}
