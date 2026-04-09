import type { GraphSnapshot } from '@/algorithms/shared/inputs';
import type { AlgorithmStep } from '@/types/algorithm';

export function createGraphStep(
  graph: GraphSnapshot,
  current: string | null,
  visited: Set<string>,
  frontier: string[],
  order: string[],
  description: string
): AlgorithmStep {
  return {
    kind: 'graph',
    nodes: graph.nodes,
    edges: graph.edges,
    current,
    visited: [...visited],
    frontier: [...frontier],
    order: [...order],
    description,
  };
}
